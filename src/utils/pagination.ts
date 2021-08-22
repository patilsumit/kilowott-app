import Constants from "./constants";

const getPaginationDetails = (requestObject: any = "") => {
    const { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } = Constants;
    const { query = "" } = requestObject;
    const { page = DEFAULT_PAGE, size = DEFAULT_PAGE_SIZE } = query;
    const PAGE = parseInt(page) || DEFAULT_PAGE;
    const LIMIT = parseInt(size) || DEFAULT_PAGE_SIZE;
    const SKIP = LIMIT * PAGE - LIMIT;
    return { PAGE, LIMIT, SKIP };
};

export default getPaginationDetails;