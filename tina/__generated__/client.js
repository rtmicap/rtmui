import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: "http://localhost:4001/graphql", token: "20af73286edce28ed17e5a315847c3fd6be17da4", queries });
export default client;
