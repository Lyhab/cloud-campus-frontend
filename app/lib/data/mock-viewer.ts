import { users } from "./users";

const MOCK_VIEWER_ID = "u4";

const viewer = users.find((user) => user.id === MOCK_VIEWER_ID);

if (!viewer) {
  throw new Error(`Mock viewer with ID "${MOCK_VIEWER_ID}" was not found.`);
}

export const mockViewer = viewer;
