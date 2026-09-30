using Microsoft.EntityFrameworkCore.Migrations;
#nullable disable
namespace Akinel.Infrastructure.Migrations
{
    public partial class AddAnnouncementAndCategoryImage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "AnnouncementBanner", table: "BusinessSettings", type: "character varying(500)", maxLength: 500, nullable: true);
            migrationBuilder.AddColumn<string>(name: "ImageUrl", table: "Categories", type: "character varying(1000)", maxLength: 1000, nullable: true);
        }
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "AnnouncementBanner", table: "BusinessSettings");
            migrationBuilder.DropColumn(name: "ImageUrl", table: "Categories");
        }
    }
}
