export class DriveSecurityRule {

  public ruleId: number = 0;
  public roleName: string = '';
  public ruleText: string = '';
  public users: string = '';
  public accessLevel: string = '';
  public exclude: boolean = false;

  public validate(): string[] | null {
    //user must populate EITHER "users" OR "roleName" field
    let hasPermissionSource = this.users || this.roleName;
    let hasAccessLevel = this.accessLevel;
    let hasRuleText = this.ruleText;

    let messages = [];
    if (!hasPermissionSource) {
      messages.push("Please populate either 'Role Name' or 'Users'");
    }
    if (!hasRuleText) {
      messages.push("Please populate the Rule Text");
    }
    if (!hasAccessLevel) {
      messages.push("Please select an Access Level");
    }

    //returning 'messages' populates the 'errors' field in the formGroup
    return (hasPermissionSource && hasRuleText && hasAccessLevel) ? null : messages;
  }

}
