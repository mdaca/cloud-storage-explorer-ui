export interface Validated {

  /** returns a list of errors if the implementing object contains any */
  validate(): string[] | null;

}