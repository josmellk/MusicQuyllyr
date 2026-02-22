import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("payment_schedules", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table
            .uuid("booking_id")
            .references("id")
            .inTable("bookings")
            .onDelete("CASCADE")
            .notNullable();
        table.decimal("amount", 10, 2).notNullable();
        table.date("due_date").notNullable();
        table.date("billing_period_start").nullable();
        table.date("billing_period_end").nullable();
        table.integer("billing_period_duration").nullable().defaultTo(30);
        table
            .enum("status", ["PENDING", "PAID", "PARTIAL", "FAILED", "OVERDUE"])
            .defaultTo("PENDING");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });

    // Adding payment_mode to bookings to track the selected plan
    await knex.schema.alterTable("bookings", (table) => {
        table.string("payment_plan_id").nullable(); // Reference to a plan definition if exists
        table.enum("payment_type", ["FULL", "DEFERRED", "SPLIT"]).defaultTo("FULL");
    });

    // Adding payment_schedule_id to payments to link actual payments to scheduled installments
    await knex.schema.alterTable("payments", (table) => {
        table
            .uuid("payment_schedule_id")
            .references("id")
            .inTable("payment_schedules")
            .onDelete("SET NULL")
            .nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("payments", (table) => {
        table.dropColumn("payment_schedule_id");
    });
    await knex.schema.alterTable("bookings", (table) => {
        table.dropColumn("payment_type");
        table.dropColumn("payment_plan_id");
    });
    await knex.schema.dropTable("payment_schedules");
}
