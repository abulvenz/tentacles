export const deepEqual = (a, b) => {
    // console.log(typeof a, typeof b);
    if (typeof a !== typeof b) return false;
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a === "object") {
      if (Object.keys(a).length !== Object.keys(b).length) return false;
      for (const key in a) {
        if (!deepEqual(a[key], b[key])) return false;
      }
      return true;
    }
    return false;
  }
