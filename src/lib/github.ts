/**
 * GitHub Data Extraction Service using Octokit.
 * All functions handle errors gracefully and return nulls/defaults on failure.
 */
import { Octokit } from "@octokit/rest";
import { truncate } from "./utils";

function createOctokit(token?: string) {
    return new Octokit({
        auth: token || process.env.GITHUB_TOKEN,
        request: { timeout: 15000 },
    });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RepoMetadata {
    fullName: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    watchers: number;
    defaultBranch: string;
    homepage: string | null;
    topics: string[];
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    size: number;
    isPrivate: boolean;
    license: string | null;
}

export interface Commit {
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
}

export interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
}

export interface RepoStatus {
    openIssues: number;
    closedIssues: number;
    openPRs: number;
    closedPRs: number;
    totalDeployments: number;
}

export interface TechStackCategory {
    source: string;
    raw: string;
    dependencies: string[];
    devDependencies: string[];
}

export interface TechStack {
    frontend: TechStackCategory | null;
    backend: TechStackCategory | null;
}

export async function getTechStack(
    owner: string,
    repo: string,
    token?: string
): Promise<TechStack> {
    const octokit = createOctokit(token);

    const candidates = [
        // Frontend paths
        { path: "package.json", type: "node", side: "root" },
        { path: "frontend/package.json", type: "node", side: "frontend" },
        { path: "client/package.json", type: "node", side: "frontend" },
        { path: "web/package.json", type: "node", side: "frontend" },
        { path: "ui/package.json", type: "node", side: "frontend" },
        // Backend paths
        { path: "backend/package.json", type: "node", side: "backend" },
        { path: "server/package.json", type: "node", side: "backend" },
        { path: "api/package.json", type: "node", side: "backend" },
        { path: "requirements.txt", type: "python", side: "backend" },
        { path: "backend/requirements.txt", type: "python", side: "backend" },
        { path: "server/requirements.txt", type: "python", side: "backend" },
        { path: "pom.xml", type: "java", side: "backend" },
        { path: "backend/pom.xml", type: "java", side: "backend" },
        { path: "go.mod", type: "go", side: "backend" },
        { path: "Cargo.toml", type: "rust", side: "backend" },
    ];

    const results = await Promise.allSettled(
        candidates.map((c) =>
            octokit.repos.getContent({ owner, repo, path: c.path }).then((res) => ({ ...res, candidate: c }))
        )
    );

    const successful = results
        .filter((r) => r.status === "fulfilled" && "content" in r.value.data && r.value.data.content)
        .map((r) => (r.status === "fulfilled" ? r.value : null))
        .filter(Boolean) as any[];

    const parsedStacks = successful.map((res) => {
        const raw = Buffer.from(res.data.content, "base64").toString("utf-8");
        const candidate = res.candidate;
        let deps: string[] = [];
        let devDeps: string[] = [];

        if (candidate.type === "node") {
            try {
                const pkg = JSON.parse(raw);
                deps = Object.keys(pkg.dependencies ?? {});
                devDeps = Object.keys(pkg.devDependencies ?? {});
            } catch {
                // ignore
            }
        } else if (candidate.type === "python") {
            deps = raw.split("\n").filter((l: string) => l.trim() && !l.startsWith("#"));
        }

        return {
            source: candidate.path,
            raw: truncate(raw, 5000),
            dependencies: deps,
            devDependencies: devDeps,
            side: candidate.side,
        };
    });

    let frontend: TechStackCategory | null = null;
    let backend: TechStackCategory | null = null;

    const explicitFrontend = parsedStacks.find((s) => s.side === "frontend");
    const explicitBackend = parsedStacks.find((s) => s.side === "backend");

    if (explicitFrontend) frontend = explicitFrontend;
    if (explicitBackend) backend = explicitBackend;

    const rootPkg = parsedStacks.find((s) => s.side === "root");
    if (rootPkg) {
        const allDeps = [...rootPkg.dependencies, ...rootPkg.devDependencies];
        const frontendKeywords = ["react", "next", "vue", "svelte", "@angular/core", "vite"];
        const backendKeywords = ["express", "nestjs", "fastify", "mongoose", "pg", "typeorm"];

        const isFrontend = allDeps.some((d) => frontendKeywords.includes(d));
        const isBackend = allDeps.some((d) => backendKeywords.includes(d));

        if (!frontend && (isFrontend || !isBackend)) {
            frontend = Object.assign({}, rootPkg, { source: "frontend (root)" });
        }
        if (!backend && isBackend) {
            backend = Object.assign({}, rootPkg, { source: "backend (root)" });
        }
    }

    return { frontend, backend };
}

export interface KeyFile {
    path: string;
    content: string;
}

// ─── 1. Repository Metadata ───────────────────────────────────────────────────

export async function getRepoMetadata(
    owner: string,
    repo: string,
    token?: string
): Promise<RepoMetadata> {
    const octokit = createOctokit(token);
    const { data } = await octokit.repos.get({ owner, repo });
    return {
        fullName: data.full_name,
        description: data.description,
        language: data.language,
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.watchers_count,
        defaultBranch: data.default_branch,
        homepage: data.homepage,
        topics: data.topics ?? [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at ?? "",
        size: data.size,
        isPrivate: data.private,
        license: data.license?.name ?? null,
    };
}

// ─── 2. Commits ───────────────────────────────────────────────────────────────

export async function getCommits(
    owner: string,
    repo: string,
    token?: string
): Promise<{ total: number; recent: Commit[] }> {
    const octokit = createOctokit(token);

    // Fetch recent commits (last 30)
    const { data } = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 30,
    });

    const recent: Commit[] = data.map((c) => ({
        sha: c.sha.slice(0, 7),
        message: c.commit.message.split("\n")[0].slice(0, 100),
        author: c.commit.author?.name ?? c.author?.login ?? "Unknown",
        date: c.commit.author?.date ?? "",
        url: c.html_url,
    }));

    // Get total commit count via contributors stats (best estimate)
    let total = recent.length;
    try {
        const contributors = await octokit.repos.listContributors({ owner, repo, per_page: 100 });
        total = contributors.data.reduce((sum, c) => sum + (c.contributions ?? 0), 0);
    } catch {
        // Ignore — large repos may timeout on stats
    }

    return { total, recent };
}

// ─── 3. Contributors ──────────────────────────────────────────────────────────

export async function getContributors(
    owner: string,
    repo: string,
    token?: string
): Promise<Contributor[]> {
    const octokit = createOctokit(token);
    const { data } = await octokit.repos.listContributors({
        owner,
        repo,
        per_page: 15,
    });

    return data.map((c) => ({
        login: c.login ?? "ghost",
        avatar_url: c.avatar_url ?? "",
        html_url: c.html_url ?? "",
        contributions: c.contributions ?? 0,
    }));
}

// ─── 4. Issues & Pull Requests ────────────────────────────────────────────────

export async function getRepoStatus(
    owner: string,
    repo: string,
    token?: string
): Promise<RepoStatus> {
    const octokit = createOctokit(token);

    const [openIssuesRes, closedIssuesRes, openPRsRes, closedPRsRes] = await Promise.allSettled([
        octokit.search.issuesAndPullRequests({ q: `repo:${owner}/${repo} is:issue state:open`, per_page: 1 }),
        octokit.search.issuesAndPullRequests({ q: `repo:${owner}/${repo} is:issue state:closed`, per_page: 1 }),
        octokit.search.issuesAndPullRequests({ q: `repo:${owner}/${repo} is:pr state:open`, per_page: 1 }),
        octokit.search.issuesAndPullRequests({ q: `repo:${owner}/${repo} is:pr state:closed`, per_page: 1 }),
    ]);

    function getCount(res: PromiseSettledResult<any>): number {
        if (res.status === "fulfilled" && res.value?.data) {
            return res.value.data.total_count ?? 0;
        }
        return 0;
    }

    let totalDeployments = 0;
    try {
        const { data } = await octokit.repos.listDeployments({ owner, repo, per_page: 1 });
        totalDeployments = data.length;
    } catch {
        // Deployments may not exist
    }

    return {
        openIssues: getCount(openIssuesRes),
        closedIssues: getCount(closedIssuesRes),
        openPRs: getCount(openPRsRes),
        closedPRs: getCount(closedPRsRes),
        totalDeployments,
    };
}

export interface FilteredIssue {
    id: number;
    number: number;
    title: string;
    state: string;
    html_url: string;
    created_at: string;
    user: {
        login: string;
        avatar_url: string;
    };
    labels: {
        name: string;
        color: string;
    }[];
    comments: number;
}

export async function getFilteredIssues(
    owner: string,
    repo: string,
    options: {
        labels?: string[];
        type?: "issue" | "pr";
        sort?: "created-desc" | "created-asc" | "comments-desc";
    },
    token?: string
): Promise<FilteredIssue[]> {
    const octokit = createOctokit(token);

    let q = `repo:${owner}/${repo}`;

    if (options.type) {
        q += ` is:${options.type}`;
    } else {
        q += ` is:issue`; // Default to issues
    }

    if (options.labels && options.labels.length > 0) {
        // Join labels with a comma for an OR search: label:"bug","enhancement"
        const labelsQuery = options.labels.map(l => `"${l}"`).join(",");
        q += ` label:${labelsQuery}`;
    }

    let sortParam: "created" | "updated" | "comments" = "created";
    let orderParam: "desc" | "asc" = "desc";

    if (options.sort === "created-asc") {
        sortParam = "created";
        orderParam = "asc";
    } else if (options.sort === "comments-desc") {
        sortParam = "comments";
        orderParam = "desc";
    }

    try {
        const { data } = await octokit.search.issuesAndPullRequests({
            q,
            sort: sortParam,
            order: orderParam,
            per_page: 30, // Fetch top 30 matching issues
        });

        return data.items.map((item: any) => ({
            id: item.id,
            number: item.number,
            title: item.title,
            state: item.state,
            html_url: item.html_url,
            created_at: item.created_at,
            user: {
                login: item.user?.login ?? "ghost",
                avatar_url: item.user?.avatar_url ?? "",
            },
            labels: (item.labels || []).map((l: any) => ({
                name: l.name,
                color: l.color || "6366f1",
            })),
            comments: item.comments,
        }));
    } catch (error) {
        console.error("Failed to fetch filtered issues:", error);
        return [];
    }
}


// ─── 6. File Tree ─────────────────────────────────────────────────────────────

export interface TreeItem {
    path: string;
    type: "blob" | "tree";
    size?: number;
}

export async function getFileTree(
    owner: string,
    repo: string,
    branch: string,
    token?: string
): Promise<TreeItem[]> {
    const octokit = createOctokit(token);
    try {
        const { data } = await octokit.git.getTree({
            owner,
            repo,
            tree_sha: branch,
            recursive: "1",
        });

        return (data.tree as TreeItem[])
            .filter((item) => item.path && !item.path.includes("node_modules") && !item.path.includes(".git"))
            .slice(0, 500); // Cap at 500 files to avoid token overflow
    } catch {
        return [];
    }
}

// ─── 7. Key File Contents ─────────────────────────────────────────────────────

const ROUTING_PATTERNS = [
    // Next.js App Router
    "app/page.tsx", "app/page.ts", "app/layout.tsx",
    "app/api",
    // Next.js Pages Router
    "pages/index.tsx", "pages/index.ts", "pages/api",
    // Express / Node
    "routes/", "router.js", "router.ts", "server.js", "server.ts", "app.js", "app.ts", "index.js", "index.ts",
    // Python / Django / FastAPI
    "urls.py", "main.py", "app.py", "routes.py",
    // READMEs
    "README.md", "readme.md", "frontend/README.md", "backend/README.md",
    "FRONTEND_README.md", "BACKEND_README.md",
];

export async function getKeyFileContents(
    owner: string,
    repo: string,
    fileTree: TreeItem[],
    token?: string
): Promise<KeyFile[]> {
    const octokit = createOctokit(token);
    const filePaths = fileTree.map((f) => f.path ?? "");

    // Score each file
    const priority: string[] = [];

    for (const pattern of ROUTING_PATTERNS) {
        const matches = filePaths.filter(
            (p) => p === pattern || p.startsWith(pattern) || p.endsWith(pattern)
        );
        priority.push(...matches.filter((m) => !priority.includes(m)));
        if (priority.length >= 20) break;
    }

    // Fetch up to 20 key files
    const results: KeyFile[] = [];
    for (const path of priority.slice(0, 20)) {
        try {
            const { data } = await octokit.repos.getContent({ owner, repo, path });
            if ("content" in data && data.content) {
                const content = Buffer.from(data.content, "base64").toString("utf-8");
                results.push({ path, content: truncate(content, 4000) });
            }
        } catch {
            // File may have moved or be binary, skip
        }
    }

    return results;
}
