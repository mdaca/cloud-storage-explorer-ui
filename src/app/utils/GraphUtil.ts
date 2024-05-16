import {ByteUtil} from "./ByteUtil";

export class GraphUtil {

  public static getGraphParameters(data: number[], tickCount: number): Map<string, number> {
    let graphParams: Map<string, any> = new Map<string, any>();

    graphParams.set("tickCount", tickCount);
    let max = Math.max(...data);
    graphParams.set("max", max);
    let min = Math.min(...data);
    graphParams.set("min", min);

    this.makeGraphPrettier(graphParams);
    let prettyTickSize = graphParams.get("zTickSize");
    let newMin = prettyTickSize * Math.round(min / prettyTickSize);

    let tickList: number[] = [];
    for (let i = 0; i < tickCount + 1; i++) {
      let newTick = ByteUtil.toPrecision((newMin + (i * prettyTickSize)), 3);
      tickList.push(newTick);
    }

    return graphParams;
  }

  static makeGraphPrettier(graphParams: Map<string, number>): void {
    // @ts-ignore
    let min: number = graphParams.get("min");
    let prettyMin = Math.floor(min * 10) / 10;
    // @ts-ignore
    let max: number = graphParams.get("max");
    let prettyMax = Math.round(max * 10) / 10;

    let tickCount = graphParams.get("tickCount") || 5;
    let unroundedTickSize = (prettyMax - prettyMin) / tickCount;

    let x = (unroundedTickSize <= 0.0)
      ? 1
      : Math.ceil(Math.log10(unroundedTickSize) - 1);
    let pow10x = Math.pow(10, x);

    let roundedTickSize = Math.ceil(unroundedTickSize / pow10x) * pow10x;
    let prettyTickSize = roundedTickSize;	// arbitrary number = 1K

    // If the min is much larger than the roundedTickRange, then the numbers
    // displaying on the Y axis would look identical due to truncation of
    // the least significant digits.  This code makes sure that the tick range
    // is never less than 1% of the min value, so that if we display 3 digits,
    // they will always be different.

    // min and max are the same, make a non-zero tick size
    if (this.equal(0, roundedTickSize)) {
      if (this.equal(0, prettyMin)) {
        prettyTickSize = 1000;
      } else {
        prettyTickSize = prettyMin / 100;
        // because the min and max are the same and
        // not zero, put the flat line near the center of the Y-axis
        prettyMin = (prettyMin - prettyTickSize * tickCount / 2);
      }
    } else if (prettyMin / roundedTickSize > 1000) {
      // min and max are different, but only a little bit.
      // make an adequate tick size
      prettyTickSize = prettyMin / 100;
      // because the min and max are close to the same and
      // not zero, put the flat line near the center of the Y-axis
      prettyMin = (prettyMin - prettyTickSize * tickCount / 2);
    }
    prettyMax = (prettyMin + prettyTickSize * tickCount);

    graphParams.set("zMin", prettyMin);
    graphParams.set("zMax", Math.round(prettyMax * 1000) / 1000);
    graphParams.set("zTickSize", Math.round(prettyTickSize *  1000) / 1000);
  }

  static equal(a: number, b: number): boolean {
    return (Math.abs(a - b) <= 0.000001);
  }

}
