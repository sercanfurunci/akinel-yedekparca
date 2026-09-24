using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akinel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleCatalogFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExternalId",
                table: "VehicleModels",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExternalId",
                table: "VehicleMakes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExternalId",
                table: "VehicleGenerations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisplacementCc",
                table: "VehicleEngines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Drivetrain",
                table: "VehicleEngines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExternalId",
                table: "VehicleEngines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gearbox",
                table: "VehicleEngines",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "VehicleModels");

            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "VehicleMakes");

            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "VehicleGenerations");

            migrationBuilder.DropColumn(
                name: "DisplacementCc",
                table: "VehicleEngines");

            migrationBuilder.DropColumn(
                name: "Drivetrain",
                table: "VehicleEngines");

            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "VehicleEngines");

            migrationBuilder.DropColumn(
                name: "Gearbox",
                table: "VehicleEngines");
        }
    }
}
