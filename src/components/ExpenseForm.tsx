import { categories } from "../data/categories";
import DatePicker from 'react-date-picker';
import "react-calendar/dist/Calendar.css"
import "react-date-picker/dist/DatePicker.css"
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { DraftExpense, Value } from "../types";
import ErrorMessage from "./ErrorMessage";
import { useBudget } from "../hooks/useBudget";

const initialDrafExpense = {
    amount: 0,
    expenseName: '',
    category: '',
    date: new Date()
}

export default function ExpenseForm() {
    const [ expense, setExpense ] = useState<DraftExpense>(initialDrafExpense)

    const [error, setError] = useState('')
    const { state, dispatch, remainingBudget } = useBudget()
    const [previousAmount, setPreviousAmount] = useState(0)

    useEffect(() => {
        if (state.editingId) {
            const editingExpense = state.expenses.filter(currentExpense => currentExpense.id === state.editingId)[0]
            setExpense(editingExpense)
            setPreviousAmount(editingExpense.amount)
        }
    }, [state.editingId])

    const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        const isAmountField = ['amount'].includes(name)
        setExpense({
            ...expense,
            [name]: isAmountField ? +value : value
        })
    }

    const handleChangeDate = (value: Value) => {
        setExpense({
            ...expense,
            date: value
        })
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (Object.values(expense).includes('')) {
            setError('Todos los campos son obligatorios')
            return
        }

        if ((expense.amount - previousAmount) > remainingBudget) {
            setError('Ese gasto se sale del presupuesto')
            return
        }

        // Agregar o actualizar
        if (state.editingId) {
            dispatch({type: 'update-expense', payload: { expense: {...expense, id: state.editingId} }})
        } else {
            dispatch({ type: 'add-expense', payload: { expense } })
        }

        setExpense(initialDrafExpense)
        setPreviousAmount(0)
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <legend className="uppercase text-center text-2xl font-bold border-b-4 border-blue-500 py-2">
                {state.editingId ? 'Guardar Cambios' : 'Nuevo Gasto'}
            </legend>

            {error && <ErrorMessage>{error}</ErrorMessage> }

            <div className="flex flex-col gap-2">
                <label 
                    htmlFor="expenseName"
                    className="text-xl">
                    Nombre Gasto:
                </label>

                <input 
                    type="text"
                    id="expenseName" 
                    name="expenseName"
                    placeholder="Agrega el nombre del gasto"
                    className="bg-slate-200 p-2"
                    value={expense.expenseName}
                    onChange={handleChange} />
            </div>

            <div className="flex flex-col gap-2">
                <label 
                    htmlFor="amount"
                    className="text-xl">
                    Cantidad:
                </label>

                <input 
                    type="number"
                    id="amount" 
                    name="amount"
                    placeholder="Agrega la cantidad del gasto: ej. 300"
                    className="bg-slate-200 p-2"
                    value={expense.amount}
                    onChange={handleChange} />
            </div>

            <div className="flex flex-col gap-2">
                <label 
                    htmlFor="category"
                    className="text-xl">
                    Cantidad:
                </label>

                <select 
                    id="category" 
                    name="category"
                    className="bg-slate-200 p-2"
                    value={expense.category}
                    onChange={handleChange}>
                        <option value="">-- Seleccione una Categoria --</option>
                        {categories.map(category => (
                            <option 
                                key={category.id} 
                                value={category.id}>
                                {category.name}
                            </option>
                        ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label 
                    htmlFor="amount"
                    className="text-xl">
                    Fecha Gasto:
                </label>

                <DatePicker
                    className=""
                    value={expense.date}
                    onChange={handleChangeDate}
                />
            </div>

            <input 
                type="submit"
                className="bg-blue-600 cursor-pointer w-full p-2 text-white uppercase font-bold rounded-lg"
                value={state.editingId ? 'Guardar Cambios' : 'Registro Gasto'} />
        </form>
    )
}   