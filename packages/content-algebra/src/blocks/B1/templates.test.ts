import { describeBlock } from "../blockTests";
import { B1_TEMPLATES } from "./templates";

describeBlock("B1", B1_TEMPLATES, {
  validStep: ["B1.T5"],
  findError: { "B1.T6": ["0", "1", "null"] },
});
