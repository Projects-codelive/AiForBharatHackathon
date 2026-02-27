/**
 * Main analysis orchestration API route.
 *
 * POST /api/analyze
 * Body: { repoUrl: string, forceRefresh?: boolean }
 *
 * Flow:
 * 1. Validate auth session
 * 2. Parse & validate GitHub URL
 * 3. Check MongoDB cache (unless forceRefresh)
 * 4. Fetch all GitHub data in parallel
 * 5. Run LLM analysis (architecture + routes)
 * 6. Save to MongoDB
 * 7. Return full analysis
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { RepositoryAnalysis } from "@/models/RepositoryAnalysis";
import { parseGitHubUrl } from "@/lib/utils";
import {
    getRepoMetadata,
    getCommits,
    getContributors,
    getRepoStatus,
    getTechStack,
    getFileTree,
    getKeyFileContents,
} from "@/lib/github";
import { analyzeArchitecture, analyzeRoutes } from "@/lib/llm";

export const maxDuration = 300; // Vercel: allow up to 5 minutes for heavy analysis

export async function POST(req: NextRequest) {
    // ── 1. Auth check ──────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // ── 2. Parse request body ──────────────────────────────────────────
    let body: { repoUrl: string; forceRefresh?: boolean };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { repoUrl, forceRefresh = false } = body;

    if (!repoUrl) {
        return NextResponse.json({ error: "repoUrl is required." }, { status: 400 });
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
        return NextResponse.json(
            { error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" },
            { status: 400 }
        );
    }

    const { owner, repo } = parsed;

    // ── 3. Connect to DB & check cache ─────────────────────────────────
    await connectDB();

    // Normalize URL (strip trailing slash / .git)
    const normalizedUrl = `https://github.com/${owner}/${repo}`;

    if (!forceRefresh) {
        const cached = await RepositoryAnalysis.findOne({ repoUrl: normalizedUrl }).lean();
        if (cached) {
            return NextResponse.json({ cached: true, data: cached }, { status: 200 });
        }
    }

    // ── 4. Fetch GitHub data in parallel ───────────────────────────────
    try {
        const githubToken = session.githubAccessToken || process.env.GITHUB_TOKEN;

        const [metadata, commits, contributors, repoStatus, techStack] = await Promise.all([
            getRepoMetadata(owner, repo, githubToken),
            getCommits(owner, repo, githubToken),
            getContributors(owner, repo, githubToken),
            getRepoStatus(owner, repo, githubToken),
            getTechStack(owner, repo, githubToken),
        ]);

        // File tree requires the default branch from metadata
        const defaultBranch = metadata.defaultBranch || "main";
        const fileTree = await getFileTree(owner, repo, defaultBranch, githubToken);
        const keyFileContents = await getKeyFileContents(owner, repo, fileTree, githubToken);

        // ── 5. LLM Analysis ──────────────────────────────────────────────
        const [architectureResult, routesResult] = await Promise.all([
            analyzeArchitecture(fileTree, techStack, keyFileContents),
            analyzeRoutes(keyFileContents, fileTree, techStack),
        ]);

        console.log("TECH STACK PAYLOAD:", JSON.stringify(techStack, null, 2));

        const llmAnalysis = {
            overallFlow: architectureResult.overallFlow,
            architectureMermaid: architectureResult.architectureMermaid,
            routes: routesResult,
        };

        // ── 6. Save to MongoDB ────────────────────────────────────────────
        const fileTreeStr = JSON.stringify(fileTree);

        const analysisDoc = await RepositoryAnalysis.findOneAndUpdate(
            { repoUrl: normalizedUrl },
            {
                repoUrl: normalizedUrl,
                owner,
                repoName: repo,
                metadata,
                commits,
                contributors,
                repoStatus,
                techStack: techStack as unknown as Record<string, unknown>,
                fileTree: fileTreeStr,
                keyFileContents,
                llmAnalysis,
                analyzedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        // ── 7. Return result ──────────────────────────────────────────────
        // Temporarily bypass MongoDB schema for the techStack in the response to test
        const responseData = analysisDoc.toObject ? analysisDoc.toObject() : analysisDoc;
        responseData.techStack = techStack as unknown as Record<string, unknown>;

        return NextResponse.json({ cached: false, data: responseData }, { status: 200 });
    } catch (err: unknown) {
        console.error("[/api/analyze] Error:", err);

        // Handle GitHub rate limiting
        if (err && typeof err === "object" && "status" in err) {
            const status = (err as { status: number }).status;
            if (status === 403) {
                return NextResponse.json(
                    { error: "GitHub API rate limit exceeded. Please try again in an hour or add a GITHUB_TOKEN." },
                    { status: 429 }
                );
            }
            if (status === 404) {
                return NextResponse.json(
                    { error: "Repository not found. Is it private? Make sure your GitHub token has repo access." },
                    { status: 404 }
                );
            }
        }

        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 });
    }
}

// GET: check if a repo has been analyzed (for initial cache check)
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoUrl = searchParams.get("repoUrl");
    if (!repoUrl) return NextResponse.json({ cached: false });

    await connectDB();
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) return NextResponse.json({ cached: false });

    const normalizedUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
    const existing = await RepositoryAnalysis.findOne({ repoUrl: normalizedUrl })
        .select("repoUrl analyzedAt owner repoName")
        .lean();

    return NextResponse.json({ cached: !!existing, meta: existing });
}
