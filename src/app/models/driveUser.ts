import {Validated} from "./interfaces/validated";

export class DriveUser implements Validated {

  public userId: number = 0;
  public userName: string = "";

  public validate(): string[] | null {
    return this.userName ? null : ["Please populate 'Administrator Name'"];
  }

}
