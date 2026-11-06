import { describeBlock } from "../blockTests";
import { B6_TEMPLATES } from "./templates";

describeBlock("B6", B6_TEMPLATES, {
  validStep: ["B6.T5"],
  findError: { "B6.T6": ["0", "1", "2", "3", "null"], "B6.T7": ["0", "1", "null"] },
});
