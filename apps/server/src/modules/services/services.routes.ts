import { Router } from "express";

import { serviceCategories } from "../../data/services.js";

import { successResponse } from "../../utils/ApiResponse.js";

const router = Router();

const services = serviceCategories.flatMap((category) =>
  category.services.map((service) => ({
    ...service,
    category: {
      slug: category.slug,
      name: category.name
    }
  }))
);

router.get("/categories", (_request, response) => {
  response.status(200).json(successResponse(serviceCategories, "Service categories fetched"));
});

router.get("/categories/:slug", (request, response) => {
  const category = serviceCategories.find((item) => item.slug === request.params.slug);

  if (!category) {
    response.status(404).json({ success: false, message: "Category not found", error: "NOT_FOUND" });
    return;
  }

  response.status(200).json(successResponse(category, "Category fetched"));
});

router.get("/", (_request, response) => {
  response.status(200).json(successResponse(services, "Services fetched"));
});

router.get("/:slug", (request, response) => {
  const service = services.find((item) => item.slug === request.params.slug);

  if (!service) {
    response.status(404).json({ success: false, message: "Service not found", error: "NOT_FOUND" });
    return;
  }

  response.status(200).json(successResponse(service, "Service fetched"));
});

export const servicesRouter = router;
