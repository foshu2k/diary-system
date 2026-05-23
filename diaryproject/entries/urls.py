from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("entrylist/", views.entry_list, name="entry_list"),
    path("entry/<int:id>/", views.entry_detail, name="entry_detail"),
    path("entry/<int:id>/edit/", views.edit_entry, name="edit_entry"), 
    path("entry/<int:id>/delete/", views.delete_entry, name="delete_entry"),
    path("create/", views.create_entry, name="create_entry"),
]