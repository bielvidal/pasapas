Migracions SQL numerades (`NNN_nom.sql`), aplicades una sola vegada i en ordre per
`pasapas.db.apply_migrations` en arrencar (`AUTO_INITDB=1`). `Base.metadata.create_all` crea les
taules noves; aquí només hi van els ALTER i les dades que create_all no sap fer. Sentències
separades per `;`.
