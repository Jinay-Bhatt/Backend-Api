import { Queue } from "bullmq";
import { config } from "../config/index.js";

// Queue dedicated to compiling visually designed graphs into typescript zip artifacts and pushing them to git
export const exportQueue = new Queue("export-jobs", {
  connection: {
    url: config.redisUrl,
  },
});
