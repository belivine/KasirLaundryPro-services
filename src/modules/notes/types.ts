import Joi from "joi";

export interface Note {
    id: string
    notes: string
}

export const noteSchema = Joi.object({
    notes: Joi.string().required().messages({
        'string.empty' : 'Note Is Required'
    })
})