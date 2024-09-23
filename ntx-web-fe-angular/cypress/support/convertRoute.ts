const convertRouteToPath = (route: string) => route.replace(/(http|https):\/\/[^\/]+/i, '');

export default convertRouteToPath;
