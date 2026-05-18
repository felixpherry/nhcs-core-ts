import type { BackendBoundaryContract } from "./backend-boundary.contract";
import { createBackendBoundaryImplementation } from "./implementation/backend-boundary-implementation.server";

/** Main Adapter for Backend Boundary platform behaviour. */
export class BackendBoundary implements BackendBoundaryContract {
	private readonly implementation = createBackendBoundaryImplementation();

	readonly private: BackendBoundaryContract["private"] =
		this.implementation.private;

	readonly public: BackendBoundaryContract["public"] =
		this.implementation.public;
}
