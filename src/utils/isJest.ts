export default () => {
  try {
    return !!process?.env?.JEST_WORKER_ID;
  } catch (err) {
    return false;
  }
};
