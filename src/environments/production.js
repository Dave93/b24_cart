import environment from "./base";
const baseApi = `${process.env.REACT_APP_CRM_URL}`;
const env = environment(baseApi);
const result = {
  ...env,
  isProduction: true,
  isDevelopment: false,
};
export default result;
