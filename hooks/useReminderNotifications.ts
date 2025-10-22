import { useEffect, useState, useRef } from 'react';
import { Task } from '../types';

const CHECK_INTERVAL = 30000; // Check every 30 seconds

export function useReminderNotifications(tasks: Task[]) {
  const [permission, setPermission] = useState(Notification.permission);
  const notifiedReminders = useRef(new Set<string>());

  useEffect(() => {
    // Only ask for permission if there are reminders set and permission is not yet granted/denied.
    const hasReminders = tasks.some(t => t.reminderDateTime);
    if (permission === 'default' && hasReminders) {
      Notification.requestPermission().then(setPermission);
    }
  }, [tasks, permission]);

  useEffect(() => {
    if (permission !== 'granted') {
      return;
    }

    // Use a variable to track the last check time. This is more robust against setInterval throttling.
    let lastCheck = new Date();

    const intervalId = setInterval(() => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.reminderDateTime) {
          const reminderKey = `${task.id}-${task.reminderDateTime}`;
          if (notifiedReminders.current.has(reminderKey)) {
            return;
          }

          const reminderTime = new Date(task.reminderDateTime);
          
          // Check if the reminder time is in the past, and it occurred after our last check.
          if (reminderTime <= now && reminderTime > lastCheck) {
              new Notification(`Task Reminder: ${task.title}`, {
              body: `This task is due on ${new Date(task.deadline).toLocaleDateString()}.`,
              // Using a tag helps replace an old notification with a new one for the same task.
              tag: task.id 
            });
            notifiedReminders.current.add(reminderKey);
          }
        }
      });
      
      // Update the last check time for the next interval.
      lastCheck = now;
    }, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [tasks, permission]);
}
