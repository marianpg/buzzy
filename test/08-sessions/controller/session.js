'use strict'

module.exports = {
    list: (data, database, session) => {
        return {
            status: 200,
            json: {
                id: session.getId(),
                meta: session.getMeta(),
                data: data.session,
                check: JSON.stringify(data.session) === JSON.stringify(session.getData())
            }
        }
    },
    add: (data, database, session) => {
        data.session.randoms = data.session.randoms ? data.session.randoms : []
        data.session.randoms.push(Math.random())

        session.save(data.session)

        return {
            status: 200,
            json: {
                id: session.getId(),
                meta: session.getMeta(),
                data: session.getData()
            }
        }
    }
}