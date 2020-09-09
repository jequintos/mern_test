import { Document, Model, Schema, model } from "mongoose";

/**
 * Interface to model the Todo Schema for TypeScript.
 * @param todo:string
 * @param isDone:boolean
 * @param created:Date
 */
export interface ITodo extends Document {
  todo: string;
  isDone: boolean;
  created: Date;
}

const todoSchema: Schema = new Schema({
  todo: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    required: true,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Todo: Model<ITodo> = model("Todo", todoSchema);

export default Todo;
