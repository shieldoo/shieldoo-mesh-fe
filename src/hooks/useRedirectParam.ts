function useRedirectParam() {
  const hasParam = () => {
    const redirect = redirectParam();
    return redirect ? true : false;
  };

  const redirectParam = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const redirect = urlParams.get("redirect");

    return redirect || "";
  };

  return {
    isRedirectSet: hasParam(),
    redirect: redirectParam(),
  };
}

export default useRedirectParam;
