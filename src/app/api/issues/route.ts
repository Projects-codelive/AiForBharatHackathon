import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFilteredIssues } from "@/lib/github";
import { parseGitHubUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const urlParams = req.nextUrl.searchParams;
        const repoUrl = urlParams.get("repoUrl");
        if (!repoUrl) {
            return NextResponse.json({ error: "Missing repoUrl" }, { status: 400 });
        }

        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) {
            return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
        }

        const { owner, repo } = parsed;

        // Parse filters
        const labelsParam = urlParams.get("labels");
        const labels = labelsParam ? labelsParam.split(",").map(l => l.trim()).filter(Boolean) : undefined;

        const typeParam = urlParams.get("type") as "issue" | "pr" | undefined;
        // Validate sort to ensure it matches the allowed types exactly
        const rawSort = urlParams.get("sort");
        const allowedSorts = ["created-desc", "created-asc", "comments-desc"] as const;
        const sortParam = allowedSorts.includes(rawSort as any)
            ? (rawSort as "created-desc" | "created-asc" | "comments-desc")
            : undefined;

        const token = session.githubAccessToken;

        const issues = await getFilteredIssues(
            owner,
            repo,
            { labels, type: typeParam, sort: sortParam },
            token
        );

        return NextResponse.json({ issues });
    } catch (error) {
        console.error("Issue fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch issues", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
