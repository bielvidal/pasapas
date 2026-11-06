import { describeBlock } from "../blockTests";
import { B7_TEMPLATES } from "./templates";

describeBlock("B7", B7_TEMPLATES, {
  validStep: ["B7.T3"],
  findError: { "B7.T7": ["0", "3", "null"], "B7.T8": ["0", "1", "null"] },
});
