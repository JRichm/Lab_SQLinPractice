let nextEmp = 5

const Sequelize = require('sequelize');
require('dotenv').config();

const { CONNECTION_STRING } = process.env;

const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
});

module.exports = {
    getPendingAppointments: (req, res) => {
        sequelize.query(`
            SELECT * FROM cc_appointments
            WHERE approved = false;
        `).then(DBRes => res.status(200).send(DBRes[0]))
        .catch(err => console.log(err));
    },

    getUpcomingAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    getPastAppointments: (req, res) => {
        sequelize.query(`SELECT cc_appointments.appt_id, cc_appointments.date, cc_appointments.service_type, cc_users.first_name, cc_users.last_name 
        FROM cc_appointments
        JOIN cc_emp_appts ON cc_appointments.appt_id = cc_emp_appts.appt_id
        JOIN cc_employees ON cc_employees.emp_id = cc_emp_appts.emp_id
        JOIN cc_users ON cc_employees.user_id = cc_users.user_id
        WHERE cc_appointments.approved = true AND cc_appointments.completed = true
        ORDER BY cc_appointments.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    approveAppointment: (req, res) => {
        let {apptId} = req.body
        
        console.log(req.body)
        sequelize.query(`
        
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `).then(dbRes => {
            console.log(`dbres`)
            console.log(dbRes);
            res.status(200).send(dbRes[0])
            nextEmp += 2
        }).catch(err => console.log(err))
    },

    completeAppointment: (req, res) => {
        sequelize.query(`
            UPDATE cc_appointments
            SET completed = true
            WHERE apptId = ${req.body.appId};
        `).then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err));
    },

    getAllClients: (req, res) => {
        sequelize.query(`
            SELECT *, cc_clients.user_id FROM cc_users
            JOIN cc_clients 
            ON cc_users.user_id = cc_clients.user_id;

        `).then(DBRes => res.status(200).send(DBRes[0]))
        .catch(err => console.log(err));

    }
}
