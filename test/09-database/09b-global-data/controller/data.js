'use strict'

module.exports = {
    list: async (data, database, session) => {
        const persons = await database.executeSql('SELECT * FROM persons;')

        return {
            status: 200,
            page: 'index',
            frontmatter: {
                'ctrl-persons': persons
            }
        }
    },
    add: async (data, database, session) => {
        const firstname = request.query.firstname || 'Max'
        const lastname = request.query.lastname || 'Von Controller'
        await database.executeSql(`INSERT INTO persons (firstname, lastname) VALUES ('${firstname}', '${lastname}');`)
        const persons = await database.executeSql('SELECT * FROM persons;')
        
        return {
            status: 200,
            page: 'index',
            frontmatter: {
                'ctrl-persons': persons
            }
        }
    },
    delete: async (data, database, session) => {
        await database.executeSql(`DELETE FROM persons;`)
        const persons = await database.executeSql('SELECT * FROM persons;')
        
        return {
            status: 200,
            page: 'index',
            frontmatter: {
                'ctrl-persons': persons
            }
        }
    }
}