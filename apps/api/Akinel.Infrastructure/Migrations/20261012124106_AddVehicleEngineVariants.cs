using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akinel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleEngineVariants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VehicleEngineVariants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VehicleEngineId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubModelName = table.Column<string>(type: "text", nullable: false),
                    OpsCarId = table.Column<string>(type: "text", nullable: true),
                    DatECode = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleEngineVariants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VehicleEngineVariants_VehicleEngines_VehicleEngineId",
                        column: x => x.VehicleEngineId,
                        principalTable: "VehicleEngines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VehicleEngineVariants_VehicleEngineId",
                table: "VehicleEngineVariants",
                column: "VehicleEngineId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VehicleEngineVariants");
        }
    }
}
