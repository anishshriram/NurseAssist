import os
from sqlalchemy import (
    create_engine,
    MetaData,
    Table,
    Column,
    Integer,
    Text,
    Boolean,
    Date,
    DateTime,
    Numeric,
    ForeignKey,
    CheckConstraint,
    text,
)
from dotenv import load_dotenv


def init_db():
    # Determine the project root by going one level up from the current file's directory.
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dotenv_path = os.path.join(project_root, ".env")

    # Load environment variables from the specified .env file.
    load_dotenv(dotenv_path)

    db_uri = os.getenv("DB_URI")
    if not db_uri:
        raise ValueError("DB_URI not found in environment variables.")

    engine = create_engine(db_uri)
    metadata = MetaData()

    # Define your tables here (nurses_doctors, patients, etc.)
    nurses_doctors = Table(
        "nurses_doctors",
        metadata,
        Column("id", Integer, primary_key=True, autoincrement=True),
        Column("name", Text, nullable=False),
        Column("role", Text, nullable=False),
        Column("email", Text, nullable=False, unique=True),
        Column("password_hash", Text, nullable=False),
        Column("created_at", DateTime, server_default=text("CURRENT_TIMESTAMP")),
        CheckConstraint("role IN ('Nurse', 'Doctor', 'Admin')", name="check_role_valid"),
    )

    # patients table
    patients = Table(
        "patients",
        metadata,
        Column("id", Integer, primary_key=True, autoincrement=True),
        Column("name", Text, nullable=False),
        Column("age", Integer, CheckConstraint("age > 0"), nullable=False),
        Column("gender", Text),
        Column("medical_history", Text),
        Column("nurse_id", Integer, ForeignKey("nurses_doctors.id")),
        Column("doctor_id", Integer, ForeignKey("nurses_doctors.id")),
        Column("created_at", DateTime, server_default=text("CURRENT_TIMESTAMP")),
    )

    # symptoms table
    symptoms = Table(
        "symptoms",
        metadata,
        Column("id", Integer, primary_key=True, autoincrement=True),
        Column("name", Text, nullable=False),
        Column(
            "severity",
            Text,
            CheckConstraint("severity IN ('mild', 'moderate', 'severe')"),
            nullable=False,
        ),
        Column("duration", Text),
    )

    # conditions table
    conditions = Table(
        "conditions",
        metadata,
        Column("id", Integer, primary_key=True, autoincrement=True),
        Column("name", Text, nullable=False, unique=True),
        Column("description", Text),
    )

    # diagnoses table
    diagnoses = Table(
        "diagnoses",
        metadata,
        Column("id", Integer, primary_key=True, autoincrement=True),
        Column("patient_id", Integer, ForeignKey("patients.id")),
        Column("condition_id", Integer, ForeignKey("conditions.id")),
        Column("critical_flag", Boolean, server_default=text("FALSE")),
        Column("confidence_score", Numeric(5, 2)),
        Column("doctor_confirmation", Boolean, server_default=text("FALSE")),
        Column("diagnosis_date", Date, server_default=text("CURRENT_DATE")),
    )

    # api_logs table
    api_logs = Table(
        "api_logs",
        metadata,
        Column("id", Integer, primary_key=True, autoincrement=True),
        Column("diagnosis_id", Integer, ForeignKey("diagnoses.id")),
        Column("request_data", Text),
        Column("response_data", Text),
        Column("timestamp", DateTime, server_default=text("CURRENT_TIMESTAMP")),
    )

    # patient_symptoms association table
    patient_symptoms = Table(
        "patient_symptoms",
        metadata,
        Column("patient_id", Integer, ForeignKey("patients.id"), primary_key=True),
        Column("symptom_id", Integer, ForeignKey("symptoms.id"), primary_key=True),
    )

    # diagnosis_symptoms association table
    diagnosis_symptoms = Table(
        "diagnosis_symptoms",
        metadata,
        Column("diagnosis_id", Integer, ForeignKey("diagnoses.id"), primary_key=True),
        Column("symptom_id", Integer, ForeignKey("symptoms.id"), primary_key=True),
    )

    # Create all tables
    metadata.create_all(engine)
    print("Database tables created successfully (no initial data).")


if __name__ == "__main__":
    init_db()
