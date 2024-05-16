import {Validated} from "./interfaces/validated";

export class DriveProperty implements Validated {

  public propertyKey: string = '';
  public propertyValue: string = '';
  public propertyId: number = 0;

  //drive properties are allowed to be saved without values
  public validate(): null {
    return null;
  }

}
