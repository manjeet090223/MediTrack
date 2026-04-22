/**
 * Custom hook for generating rule-based smart messages
 * Non-AI, deterministic messages based on data
 */

export const useSmartMessages = (stats, appointments) => {
  const generateGreeting = (hour = new Date().getHours()) => {
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const generateAppointmentMessage = () => {
    const upcomingCount = stats?.upcomingAppointments || 0;
    
    if (upcomingCount === 0) {
      return {
        type: "info",
        title: "No Upcoming Appointments",
        message: "You're all caught up! Book your next appointment when ready.",
        icon: "calendar"
      };
    }
    
    if (upcomingCount === 1) {
      return {
        type: "info",
        title: "1 Upcoming Appointment",
        message: "You have an appointment coming up. Check your schedule.",
        icon: "calendar"
      };
    }
    
    return {
      type: "success",
      title: `${upcomingCount} Upcoming Appointments`,
      message: `You have ${upcomingCount} appointments scheduled. Stay on track!`,
      icon: "calendar"
    };
  };

  const generateHealthMessage = (healthScore = 70, medicineAdherence = 50) => {
    let healthType = "info";
    let healthMessage = "";

    if (healthScore >= 80) {
      healthType = "success";
      healthMessage = "Excellent health score! Keep up the great work.";
    } else if (healthScore >= 60) {
      healthType = "info";
      healthMessage = "Your health is improving. Continue with your routine.";
    } else {
      healthType = "warning";
      healthMessage = "Consider scheduling a check-up with your doctor.";
    }

    let medicineType = "info";
    let medicineMessage = "";

    if (medicineAdherence >= 90) {
      medicineType = "success";
      medicineMessage = "Great job! You're taking your medications consistently.";
    } else if (medicineAdherence >= 70) {
      medicineType = "info";
      medicineMessage = "You're on track with your medication. Keep it up!";
    } else if (medicineAdherence >= 50) {
      medicineType = "warning";
      medicineMessage = `You've missed ${Math.round(100 - medicineAdherence)}% of your medications. Please be more consistent.`;
    } else {
      medicineType = "danger";
      medicineMessage = "Your medicine adherence is low. Please take your medications as prescribed.";
    }

    return {
      health: { type: healthType, message: healthMessage },
      medicine: { type: medicineType, message: medicineMessage }
    };
  };

  const generateStatusBanner = (stats) => {
    const { totalAppointments = 0, upcomingAppointments = 0, completedAppointments = 0 } = stats;
    
    let status = "idle";
    let message = "";
    let icon = "check";

    if (upcomingAppointments > 0) {
      status = "active";
      message = `${upcomingAppointments} appointment${upcomingAppointments > 1 ? "s" : ""} scheduled for you`;
      icon = "clock";
    } else if (completedAppointments > 0) {
      status = "completed";
      message = `You've completed ${completedAppointments} appointment${completedAppointments > 1 ? "s" : ""}`;
      icon = "check";
    } else {
      status = "empty";
      message = "No appointments yet. Book your first consultation.";
      icon = "plus";
    }

    return { status, message, icon };
  };

  const generateNextActionPrompt = (stats, appointments) => {
    if (stats?.upcomingAppointments === 0) {
      return {
        action: "book",
        text: "Ready to book an appointment?",
        buttonText: "Book Now"
      };
    }

    if (appointments && appointments.length > 0) {
      const nextAppointment = appointments[0];
      const appointmentDate = new Date(nextAppointment?.appointmentDate);
      const today = new Date();
      const daysUntil = Math.ceil((appointmentDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntil === 1) {
        return {
          action: "reminder",
          text: "Your appointment is tomorrow! Don't forget.",
          buttonText: "View Details"
        };
      }

      if (daysUntil <= 3 && daysUntil > 0) {
        return {
          action: "reminder",
          text: `Your appointment is in ${daysUntil} days.`,
          buttonText: "View Details"
        };
      }
    }

    return {
      action: "explore",
      text: "Explore our health features",
      buttonText: "Learn More"
    };
  };

  return {
    greeting: generateGreeting(),
    appointment: generateAppointmentMessage(),
    health: generateHealthMessage(),
    statusBanner: generateStatusBanner(stats),
    nextAction: generateNextActionPrompt(stats, appointments)
  };
};
