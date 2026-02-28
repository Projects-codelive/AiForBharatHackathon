/**
 * RouteCache model — dedicated collection for per-route deep analysis results.
 *
 * Using a separate collection (instead of embedding in RepositoryAnalysis) avoids:
 * - Mongoose model schema caching conflicts
 * - MongoDB dot-notation key issues with slashes/dashes in route names
 * - Risk of wiping cache when the main repo document is force-refreshed
 *
 * Lookup key: (repoUrl + route) — unique compound index for O(1) reads.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRouteCache extends Document {
    repoUrl: string;
    route: string;
    flowVisualization: string;
    executionTrace: string;
    cachedAt: Date;
}

const RouteCacheSchema = new Schema<IRouteCache>(
    {
        repoUrl: { type: String, required: true, index: true },
        route: { type: String, required: true },
        flowVisualization: { type: String, required: true },
        executionTrace: { type: String, required: true },
        cachedAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// Compound unique index ensures upsert is safe and lookups are O(1)
RouteCacheSchema.index({ repoUrl: 1, route: 1 }, { unique: true });

export const RouteCache: Model<IRouteCache> =
    mongoose.models.RouteCache ||
    mongoose.model<IRouteCache>("RouteCache", RouteCacheSchema);
