from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from .models import Entry

class EntryAdmin(admin.ModelAdmin):
    list_display = ["title", "user_link", "created_at"]
    list_filter = ["user", "created_at"]
    search_fields = ["title", "user__username"]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    fieldsets = [
        (Entry._meta.verbose_name_plural, {"fields": ["title", "content"]}),
        ("Metadata", {"fields": ["user"]})
    ]

    def user_link(self, obj):
        url = reverse("admin:auth_user_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = "User"

admin.site.register(Entry, EntryAdmin)