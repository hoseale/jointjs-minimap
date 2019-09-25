function debounce(func, wait=300) {
  let timeout;
  return function () {
      let context = this;
      let args = arguments;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
          func.apply(context, args)
      }, wait);
  }
}

export {
  debounce
}