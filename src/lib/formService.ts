import api from "./api";

export const formService = {
  getAll: async () => {
    const res = await api.get("/forms");
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/forms/${id}`);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/forms/${id}`);
    return res.data;
  },
};