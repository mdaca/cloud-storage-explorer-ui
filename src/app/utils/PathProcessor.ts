export class PathProcessor {

  public static GUI_SEP = "/";

  public static isRoot(path: string) {
    return (path == null) || (path == "") || (path == this.GUI_SEP);
  }

  public static addFirstSlash(path: string) {
    return path && path.startsWith(this.GUI_SEP) ?
      path : this.GUI_SEP + path;
  }

  public static addLastSlash(path: string) {
    return path && path.endsWith(this.GUI_SEP) ?
      path : path + this.GUI_SEP;
  }

  public static removeFirstSlash(path: string) {
    return path && path.startsWith(this.GUI_SEP) ?
      path.substr(1) :
      path;
  }

  public static removeLastSlash(path: string) {
    return path && path.endsWith(this.GUI_SEP) ?
      path.substr(0, path.length - 1) :
      path;
  }

  public static addFirstAndLastSlash(path: string) {
    return this.addFirstSlash(this.addLastSlash(path));
  }

  public static getFileName(path: string): string {
    if (!path) {
      return path;
    }
    if (path.endsWith(this.GUI_SEP)) {
      path = path.substring(0, path.length - 1)
    }
    if (path.indexOf("/") == -1) {
      return path;
    }

    let split = path.split(this.GUI_SEP);
    return split[split.length - 1];
  }


  public static getParentFolderPath(path: string) {
    path = this.removeFirstSlash(this.removeLastSlash(path));

    if (this.isRoot(path)) {
      return this.GUI_SEP;
    }
    //if it doesn't contain a slash anymore, then it must be at the root
    if (path.indexOf(this.GUI_SEP) == -1) {
      return this.GUI_SEP;
    }
    return path.substring(0, path.lastIndexOf("/") + 1);
  }

  public static isExtractableType(name: string) {
    return name && (
      name.endsWith(".zip") ||
      name.endsWith(".tar") ||
      name.endsWith(".gz") ||
      name.endsWith(".jar") ||
      name.endsWith(".war") ||
      name.endsWith(".ear") ||
      name.endsWith(".Z"));
  }

  static isBdvFile(name: string) {
    return name && (
      name.endsWith(".parquet") ||
      name.endsWith(".avro") ||
      name.endsWith(".csv"));
  }

  public static isDirectorySemantically(path: string) {
    return PathProcessor.isRoot(path) || path.endsWith(PathProcessor.GUI_SEP);
  }

}
