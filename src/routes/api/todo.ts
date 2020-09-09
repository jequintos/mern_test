import { Response, Router, request } from "express";
import Todo, { ITodo } from "../../models/Todo";
import { check, validationResult } from "express-validator/check";

import HttpStatusCodes from "http-status-codes";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import auth from "../../middleware/auth";
import bcrypt from "bcryptjs";
import config from "config";
import gravatar from "gravatar";
import { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";

const returnHelper = {
  itemNotFound: (res: Response) =>
    res.status(HttpStatusCodes.NOT_FOUND).send("ID not found"),
  serverError: (res: Response) =>
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error"),
  validatorError: (res: Response, errors: unknown[]) =>
    res.status(HttpStatusCodes.BAD_REQUEST).json({ errors }),
};

const router: Router = Router();

// @route   GET api/todo
// @desc    Get the list of todo items (if no parameter) or list depending on filter
// @access  Public
router.get("/", async (req: Request, res: Response) => {
  console.log(req);
  try {
    const todos: ITodo[] = await Todo.find({});
    if (!todos) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        errors: [
          {
            msg: "No items found!",
          },
        ],
      });
    }
    return res.json(todos);
  } catch (err) {
    console.error(err.message);
    return returnHelper.serverError(res);
  }
});

// @route   GET api/todo/{todoId}
// @desc    Get a single todo item
// @access  Public
router.get(
  "/:todoId",
  [
    check("todoId", "Invalid todoId format").custom((value) =>
      isValidObjectId(value)
    ),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return returnHelper.validatorError(res, errors.array());
    }

    try {
      let { todoId } = req.params;
      const todo: ITodo = await Todo.findById({ _id: todoId });

      if (!todo) {
        return returnHelper.itemNotFound(res);
      }

      return res.json(todo);
    } catch (err) {
      console.error(err.message);
      return returnHelper.serverError(res);
    }
  }
);

// @route   POST api/todo
// @desc    Creates a new todo item and returns the object w/ id
// @access  Public
router.post(
  "/",
  [
    check("todo", "Please include a todo item!").exists(),
    check("isDone", "Please enter a valid boolean value for isDone!")
      .isBoolean()
      .optional(),
  ],

  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return returnHelper.validatorError(res, errors.array());
    }

    try {
      let { todo, isDone } = req.body;

      let todoItem = new Todo({
        todo,
        isDone,
      });

      await todoItem.save();
      return res.status(HttpStatusCodes.CREATED).json(todoItem); // or just id
    } catch (err) {
      console.error(err.message);
      return returnHelper.serverError(res);
    }
  }
);

// @route   PATCH api/todo/{todoId}
// @desc    Update a todo item and returns the updated item
// @access  Public
router.patch(
  "/:todoId",
  [
    check("todoId", "Invalid todoId format").custom((value) =>
      isValidObjectId(value)
    ),
    check("todo", "Please include a todo item!").optional(),
    check("isDone", "Please enter a valid boolean value for isDone!")
      .isBoolean()
      .optional(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return returnHelper.validatorError(res, errors.array());
    }

    try {
      let { todoId } = req.params;
      let { todo, isDone } = req.body;

      const filter = { _id: todoId };
      // Create obj w/o un-passed variables (remove undefined)
      const update = { ...(todo && { todo }), ...(isDone && { isDone }) };
      if (Object.entries(update).length == 0) {
        return res.status(HttpStatusCodes.NOT_FOUND).send("No params found");
      }

      const todoItem: ITodo = await Todo.findOneAndUpdate(filter, update, {
        new: true,
      });

      if (!todoItem) {
        return returnHelper.itemNotFound(res);
      }

      return res.status(HttpStatusCodes.OK).json(todoItem);
    } catch (err) {
      console.error(err.message);
      return returnHelper.serverError(res);
    }
  }
);

// @route   DELETE api/todo/{todoId}
// @desc    Delete a todo item, only if logged in!
// @access  Private
router.delete(
  "/:todoId",
  [
    auth,
    check("todoId", "Invalid todoId format").custom((value) =>
      isValidObjectId(value)
    ),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return returnHelper.validatorError(res, errors.array());
    }

    try {
      const { todoId } = req.params;
      const todo: ITodo = await Todo.findOneAndRemove({ _id: todoId });
      return res.status(HttpStatusCodes.OK).json(todo);
    } catch (err) {
      console.error(err.message);
      return returnHelper.serverError(res);
    }
  }
);

export default router;
