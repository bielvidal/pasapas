import { describeBlock } from "../blockTests";
import { B2_TEMPLATES } from "./templates";

describeBlock("B2", B2_TEMPLATES, {
  validStep: ["B2.T5"],
  findError: { "B2.T6": ["0", "1", "2", "null"] },
});
