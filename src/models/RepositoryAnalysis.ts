/**
 * Mongoose model: RepositoryAnalysis
 * Stores the complete analysis payload including GitHub data and LLM output.
 * repoUrl is a unique index — used for cache lookups.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const CommitSchema = new Schema(
    {
        sha: String,
        message: String,
        author: String,
        date: String,
        url: String,
    },
    { _id: false }
);

const ContributorSchema = new Schema(
    {
        login: String,
        avatar_url: String,
        html_url: String,
        contributions: Number,
    },
    { _id: false }
);

const KeyFileSchema = new Schema(
    {
        path: String,
        content: String,
    },
    { _id: false }
);

const RouteSchema = new Schema(
    {
        path: String,
        method: String,
        functionality: String,
        contribution: String,
        lifecycleRole: String,
    },
    { _id: false }
);

const LLMAnalysisSchema = new Schema(
    {
        overallFlow: String,
        architectureMermaid: String,
        routes: [RouteSchema],
    },
    { _id: false }
);

const RepoMetadataSchema = new Schema(
    {
        fullName: String,
        description: String,
        language: String,
        stars: Number,
        forks: Number,
        watchers: Number,
        defaultBranch: String,
        homepage: String,
        topics: [String],
        createdAt: String,
        updatedAt: String,
        pushedAt: String,
        size: Number,
        isPrivate: Boolean,
        license: String,
    },
    { _id: false }
);

const RepoStatusSchema = new Schema(
    {
        openIssues: Number,
        closedIssues: Number,
        openPRs: Number,
        closedPRs: Number,
        totalDeployments: Number,
    },
    { _id: false }
);

const TechStackCategorySchema = new Schema(
    {
        source: String,
        raw: String,
        dependencies: [String],
        devDependencies: [String],
    },
    { _id: false }
);

const TechStackSchema = new Schema(
    {
        frontend: { type: TechStackCategorySchema },
        backend: { type: TechStackCategorySchema },
    },
    { _id: false }
);

// ─── Main document ────────────────────────────────────────────────────────────

export interface IRepositoryAnalysis extends Document {
    repoUrl: string;
    owner: string;
    repoName: string;
    metadata: Record<string, unknown>;
    commits: {
        total: number;
        recent: unknown[];
    };
    contributors: unknown[];
    repoStatus: Record<string, unknown>;
    techStack: Record<string, unknown>;
    fileTree: string;
    keyFileContents: unknown[];
    llmAnalysis: {
        overallFlow: string;
        architectureMermaid: string;
        routes: unknown[];
    };
    analyzedAt: Date;
}

const RepositoryAnalysisSchema = new Schema<IRepositoryAnalysis>(
    {
        repoUrl: { type: String, required: true, unique: true, index: true },
        owner: { type: String, required: true },
        repoName: { type: String, required: true },
        metadata: { type: RepoMetadataSchema },
        commits: {
            total: Number,
            recent: [CommitSchema],
        },
        contributors: [ContributorSchema],
        repoStatus: { type: RepoStatusSchema },
        techStack: { type: Schema.Types.Mixed },
        fileTree: { type: String }, // JSON-stringified file tree
        keyFileContents: [KeyFileSchema],
        llmAnalysis: { type: LLMAnalysisSchema },
        analyzedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const RepositoryAnalysis: Model<IRepositoryAnalysis> =
    mongoose.models.RepositoryAnalysis ||
    mongoose.model<IRepositoryAnalysis>("RepositoryAnalysis", RepositoryAnalysisSchema);
