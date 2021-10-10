import environment from "./base";
const baseApi = `${process.env.REACT_APP_CRM_URL}`;
const env = environment(baseApi);
export default {
  ...env,
  isProduction: false,
  isDevelopment: true,
};
