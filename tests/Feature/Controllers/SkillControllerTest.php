<?php

use App\Models\Skill;
use App\Models\SkillRevision;
use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;

function createSkillTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can view skills index', function () {
    [$user] = createSkillTestUser();

    $this->actingAs($user)->get('/skills')->assertOk()
        ->assertInertia(fn ($page) => $page->component('skills/index'));
});

test('can view skill create form', function () {
    [$user] = createSkillTestUser();

    $this->actingAs($user)->get('/skills/create')->assertOk()
        ->assertInertia(fn ($page) => $page->component('skills/create'));
});

test('can store a skill', function () {
    [$user, $workspace] = createSkillTestUser();

    $this->actingAs($user)
        ->post('/skills', [
            'name' => 'Test Skill',
            'description' => 'A test skill description',
            'content' => 'Skill content here',
            'is_active' => true,
        ])
        ->assertRedirect();

    expect(Skill::withoutGlobalScopes()->where('workspace_id', $workspace->id)->where('name', 'Test Skill')->exists())->toBeTrue();
});

test('can store a skill with tags', function () {
    [$user, $workspace] = createSkillTestUser();
    $tag = Tag::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post('/skills', [
            'name' => 'Tagged Skill',
            'description' => 'A tagged skill',
            'content' => 'content',
            'tag_ids' => [$tag->id],
        ]);

    $skill = Skill::withoutGlobalScopes()->where('name', 'Tagged Skill')->first();
    expect($skill->tags()->count())->toBe(1);
});

test('can view skill edit form', function () {
    [$user, $workspace] = createSkillTestUser();
    $skill = Skill::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->get("/skills/{$skill->id}/edit")->assertOk()
        ->assertInertia(fn ($page) => $page->component('skills/edit')->has('skill'));
});

test('can update a skill', function () {
    [$user, $workspace] = createSkillTestUser();
    $skill = Skill::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/skills/{$skill->id}", [
            'name' => 'Updated Skill',
            'description' => 'Updated description',
            'content' => 'Updated content',
        ])
        ->assertRedirect();

    expect($skill->fresh()->name)->toBe('Updated Skill');
});

test('skill update creates revision when content changes', function () {
    [$user, $workspace] = createSkillTestUser();
    $skill = Skill::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Original']);

    $this->actingAs($user)
        ->put("/skills/{$skill->id}", [
            'name' => $skill->name,
            'description' => $skill->description,
            'content' => 'Updated',
        ]);

    expect(SkillRevision::where('skill_id', $skill->id)->count())->toBe(1);
    expect($skill->fresh()->version)->toBe(2);
});

test('can delete a skill', function () {
    [$user, $workspace] = createSkillTestUser();
    $skill = Skill::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->delete("/skills/{$skill->id}")->assertRedirect('/skills');

    expect(Skill::withoutGlobalScopes()->find($skill->id))->toBeNull();
});

test('can filter skills by search', function () {
    [$user, $workspace] = createSkillTestUser();
    Skill::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Laravel Expert']);
    Skill::factory()->create(['workspace_id' => $workspace->id, 'name' => 'React Expert']);

    $this->actingAs($user)->get('/skills?search=Laravel')
        ->assertInertia(fn ($page) => $page->has('skills.data', 1));
});

test('validation rejects missing skill name', function () {
    [$user] = createSkillTestUser();

    $this->actingAs($user)
        ->post('/skills', ['name' => '', 'description' => 'desc', 'content' => 'content'])
        ->assertSessionHasErrors('name');
});

test('validation rejects missing skill description', function () {
    [$user] = createSkillTestUser();

    $this->actingAs($user)
        ->post('/skills', ['name' => 'test', 'description' => '', 'content' => 'content'])
        ->assertSessionHasErrors('description');
});

test('validation rejects missing skill content', function () {
    [$user] = createSkillTestUser();

    $this->actingAs($user)
        ->post('/skills', ['name' => 'test', 'description' => 'desc', 'content' => ''])
        ->assertSessionHasErrors('content');
});

test('guests cannot access skills', function () {
    $this->get('/skills')->assertRedirect('/login');
});

test('skills are scoped to workspace on index', function () {
    [$user1, $workspace1] = createSkillTestUser();
    [$user2, $workspace2] = createSkillTestUser();

    Skill::factory()->create(['workspace_id' => $workspace1->id, 'name' => 'My Skill']);
    Skill::factory()->create(['workspace_id' => $workspace2->id, 'name' => 'Other Skill']);

    $this->actingAs($user1)->get('/skills')
        ->assertInertia(fn ($page) => $page->has('skills.data', 1));
});
