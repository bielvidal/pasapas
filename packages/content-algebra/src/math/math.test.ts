import { describe, expect, it } from "vitest";
import { fmt } from "./index";
import { Poly } from "./poly";
import { q } from "./rational";
import { RF } from "./rf";

describe("Q", () => {
  it("normalitza i opera exacte", () => {
    expect(q(2, 4).toString()).toBe("1/2");
    expect(q(2, -4).toString()).toBe("-1/2");
    expect(q(1, 3).add(q(1, 6)).toString()).toBe("1/2");
    expect(q(1, 3).mul(q(3)).isOne()).toBe(true);
    expect(q(2, 3).pow(-2).toString()).toBe("9/4");
    expect(q(1, 3).compare(q(1, 2))).toBe(-1);
  });
});

describe("Poly", () => {
  const p = Poly.from([-9, 0, 1]); // x² − 9
  it("factoritza/mcd", () => {
    const f = Poly.linear(1, -3); // x − 3
    expect(Poly.gcd(p, f).equals(f.monic())).toBe(true);
    expect(p.divmod(f)[0].equals(Poly.linear(1, 3))).toBe(true);
    expect(p.divmod(f)[1].isZero()).toBe(true);
    expect(Poly.fromRoots(3, -3).equals(p)).toBe(true);
  });
  it("eval i operacions", () => {
    expect(p.eval(q(3)).isZero()).toBe(true);
    expect(p.eval(q(1, 2)).toString()).toBe("-35/4");
    expect(Poly.X.pow(2).sub(Poly.constant(9)).equals(p)).toBe(true);
    expect(Poly.from([0, 0]).isZero()).toBe(true);
    expect(Poly.from([0, 0]).degree).toBe(-1);
  });
  it("primitive i contingut", () => {
    const [prim, f] = Poly.from([q(1, 2), q(3, 4)]).primitive(); // 3/4 x + 1/2 = (1/4)(3x + 2)
    expect(prim.equals(Poly.from([2, 3]))).toBe(true);
    expect(f.toString()).toBe("1/4");
    expect(Poly.from([12, 3]).integerContent()).toBe(3n);
  });
});

describe("RF", () => {
  const x = RF.X;
  const c = (v: number): RF => RF.of(v);
  it("equivalència exacta", () => {
    const a = RF.of(Poly.from([-9, 0, 1]), Poly.linear(1, 3)); // (x²−9)/(x+3)
    expect(a.equals(x.sub(c(3)))).toBe(true);
    expect(a.equals(x.add(c(3)))).toBe(false);
    expect(
      x
        .inv()
        .add(x.add(c(4)).inv())
        .equals(RF.of(Poly.from([4, 2]), Poly.from([0, 4, 1]))),
    ).toBe(true);
  });
  it("isSimplifiable segons la regla d'or", () => {
    expect(RF.of(Poly.from([12, 3]), Poly.constant(3)).isSimplifiable()).toBe(true); // (3x+12)/3
    expect(RF.of(Poly.from([6, 1]), Poly.constant(6)).isSimplifiable()).toBe(false); // (x+6)/6
    expect(RF.of(Poly.linear(1, 2), Poly.linear(1, 5)).isSimplifiable()).toBe(false); // (x+2)/(x+5)
    expect(RF.of(Poly.from([0, 5, 1]), Poly.X).isSimplifiable()).toBe(true); // (x²+5x)/x
    expect(RF.of(Poly.from([4, -1]), Poly.from([-4, 1])).isSimplifiable()).toBe(true); // (4−x)/(x−4)
    expect(RF.of(Poly.from([4, 2]), Poly.from([6, 2])).isSimplifiable()).toBe(true); // (2x+4)/(2x+6)
    expect(RF.of(Poly.from([4, 2]), Poly.from([0, 4, 1])).isSimplifiable()).toBe(false); // (2x+4)/(x²+4x)
  });
  it("key és canònica", () => {
    const a = RF.of(Poly.from([-9, 0, 1]), Poly.linear(1, 3));
    expect(a.key()).toBe(x.sub(c(3)).key());
    expect(RF.of(Poly.from([2, 4]), Poly.constant(2)).key()).toBe(x.mul(c(2)).add(c(1)).key());
    expect(RF.of(q(-1)).key()).not.toBe(RF.of(q(1)).key());
  });
});

describe("fmt", () => {
  it("segueix les convencions del catàleg", () => {
    expect(fmt.poly(Poly.from([3, 1]))).toBe("x + 3");
    expect(fmt.poly(Poly.from([-3, -1]))).toBe("-x - 3");
    expect(fmt.poly(Poly.from([0, 0, 1]))).toBe("x^{2}");
    expect(fmt.poly(Poly.from([9, -6, 1]))).toBe("x^{2} - 6x + 9");
    expect(fmt.poly(Poly.from([5]))).toBe("5");
    expect(fmt.poly(Poly.from([q(-2, 3), 1]))).toBe("x - \\frac{2}{3}");
    expect(fmt.poly(Poly.from([0, q(-2, 3)]))).toBe("-\\frac{2}{3}x");
    expect(fmt.poly(Poly.ZERO)).toBe("0");
    expect(fmt.num(q(-2, 3))).toBe("-\\frac{2}{3}");
  });
  it("prod i paren", () => {
    expect(fmt.prod("x", "x + 3")).toBe("x(x + 3)");
    expect(fmt.prod("x + 3", "x - 3")).toBe("(x + 3)(x - 3)");
    expect(fmt.prod("\\frac{1}{2}", "x")).toBe("\\frac{1}{2}x");
    expect(fmt.paren("-x")).toBe("-x");
    expect(fmt.frac("x + 1", "2")).toBe("\\frac{x + 1}{2}");
    expect(fmt.plus("x", "-3")).toBe("x - 3");
  });
});

describe("fmt.prod amb potències entre parèntesis", () => {
  it("no duplica parèntesis: 2x·(x − 4)^2 → 2x(x - 4)^{2}", () => {
    expect(fmt.prod("2x", "(x - 4)^{2}")).toBe("2x(x - 4)^{2}");
    expect(fmt.prod("2x", "x - 4")).toBe("2x(x - 4)");
  });
});
