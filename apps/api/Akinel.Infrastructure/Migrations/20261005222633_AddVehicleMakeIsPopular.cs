using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akinel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleMakeIsPopular : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPopular",
                table: "VehicleMakes",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPopular",
                table: "VehicleMakes");
        }
    }
}
