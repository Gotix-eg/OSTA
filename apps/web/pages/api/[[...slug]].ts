import { createApp } from "../../../server/src/app";

const app = createApp();

export default app;

export const config = {
  api: {
    bodyParser: false,
  },
};
