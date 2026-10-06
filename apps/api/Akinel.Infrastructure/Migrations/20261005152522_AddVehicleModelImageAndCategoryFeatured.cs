using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Akinel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleModelImageAndCategoryFeatured : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "VehicleModels",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsHomepageFeatured",
                table: "Categories",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "VehicleModels");

            migrationBuilder.DropColumn(
                name: "IsHomepageFeatured",
                table: "Categories");
        }
    }
}
