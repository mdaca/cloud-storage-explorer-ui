export interface ConfirmChangesComponent {

  /**
   * return true iff the form tied to the implementing component is valid
   * if the form is NOT valid, a confirm modal should appear to prevent lost changes
   */
  isSaved(): boolean;

  /**
   * return true iff the form itself is valid (able to be saved)
   */
  isValid(): boolean;

  /**
   * saves the form for the given component
   */
  save(): void;

  /**
   * shows the error modal with the component's related issues
   */
  showErrorModal(): void;

}
