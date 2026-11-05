import { describeBlock } from "../blockTests";
import { B4_TEMPLATES } from "./templates";

describeBlock("B4", B4_TEMPLATES, {
  validStep: ["B4.T4"],
  findError: { "B4.T5": ["0", "1", "null"] },
});
