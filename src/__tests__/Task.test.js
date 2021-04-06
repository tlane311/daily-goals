
// test elements
// test events

import React from 'react';

import {render, cleanup, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Task from '../../components/task/task.js';



describe('snapshot tests for Task', () => {
    const goalExample = {
        goal_id: 1,
        goal: 'Snapshot-Goal',
        status: false

    }    
    const taskData = {
        token: "",
        goal: goalExample,
        setGoalSelected: () => {},
        updateGoals: () => {},
        handleIncreasePriority: () => {},
        handleDecreasePriority: () => {}
    }

    afterEach(cleanup)

    it('should display data correctly', () => {
        const { getByTestId } = render(<Task {...taskData}/>);
        
        const checkbox = getByTestId('task-checkbox');
        const statusSpan = getByTestId('task-status-span');
        const goalSpan = getByTestId('task-goal-span');

        expect(checkbox).not.toBeChecked();
        expect(statusSpan).toBeInTheDocument();
        expect(goalSpan).toHaveTextContent('Snapshot-Goal')
    }); 
});


describe('event testing', () => {
    const goalExample = {
        goal_id: 1,
        goal: 'Event-Goal',
        status: false

    }    
    const taskData = {
        token: "",
        goal: goalExample,
        setGoalSelected: () => {},
        updateGoals: () => {},
        handleIncreasePriority: () => {},
        handleDecreasePriority: () => {}
    }

    afterEach(cleanup)

    it('should handle status changes', async () => {
        const { getByTestId } = render(<Task {...taskData}/>);
        const checkbox = getByTestId('task-checkbox');
        const statusSpan = getByTestId('task-status-span');
        const goalSpan = getByTestId('task-goal-span');
        
        fireEvent.click(statusSpan);

        

        expect(checkbox).toBeChecked();
        expect(goalSpan).toHaveClass('strikethrough');

        const deleteBtn = await waitFor( () => getByTestId('delete-goal-btn'));
        expect(deleteBtn).toBeInTheDocument();
    });
});