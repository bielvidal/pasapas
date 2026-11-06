import { describeBlock } from "../blockTests";
import { B3_TEMPLATES } from "./templates";

describeBlock("B3", B3_TEMPLATES, {
  validStep: ["B3.T5"],
  findError: { "B3.T8": ["0", "1", "2", "null"], "B3.T10": ["0", "1", "2", "null"] },
});
