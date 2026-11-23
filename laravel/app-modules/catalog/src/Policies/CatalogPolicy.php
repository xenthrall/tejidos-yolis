<?php

namespace Tequia\Catalog\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class CatalogPolicy
{
    public function viewAny(User $user): bool
    {
        return (bool) $user->is_admin;
    }

    public function view(User $user, Model $record): bool
    {
        return (bool) $user->is_admin;
    }

    public function create(User $user): bool
    {
        return (bool) $user->is_admin;
    }

    public function update(User $user, Model $record): bool
    {
        return (bool) $user->is_admin;
    }

    public function delete(User $user, Model $record): bool
    {
        return false;
    }
}
